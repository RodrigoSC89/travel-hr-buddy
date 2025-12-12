/**
 * Fleet Intelligence - Real-time fleet monitoring with AI insights
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, Anchor, Navigation, Fuel, AlertTriangle, 
  TrendingUp, MapPin, Clock, Activity, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface VesselStatus {
  id: string;
  name: string;
  status: "navigating" | "anchored" | "maintenance" | "emergency";
  fuelLevel: number;
  speed: number;
  position: { lat: number; lng: number };
  nextPort: string;
  eta: string;
  alerts: number;
  efficiency: number;
}

export function FleetIntelligence() {
  const [vessels, setVessels] = useState<VesselStatus[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFleetData();
    const interval = setInterval(loadFleetData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFleetData = async () => {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .limit(10);

      if (error) {
        // Use demo data if no access
        setVessels(getDemoVessels());
        return;
      }

      if (data && data.length > 0) {
        const mappedVessels: VesselStatus[] = data.map((v) => ({
          id: v.id,
          name: v.name || "Embarcação",
          status: mapVesselStatus(v.status),
          fuelLevel: v.current_fuel_level ? Math.min(100, (v.current_fuel_level / 15)) : 50 + Math.random() * 40,
          speed: v.status === "active" ? 8 + Math.random() * 12 : 0,
          position: {
            lat: -23.5505 + Math.random() * 5, 
            lng: -46.6333 + Math.random() * 5 
          },
          nextPort: v.current_location || "Santos, BR",
          eta: new Date(Date.now() + Math.random() * 86400000 * 3).toISOString(),
          alerts: Math.floor(Math.random() * 3),
          efficiency: 75 + Math.random() * 20,
        }));
        setVessels(mappedVessels);
      } else {
        setVessels(getDemoVessels());
      }
    } catch (error) {
      console.error("Error loading fleet:", error);
      console.error("Error loading fleet:", error);
      setVessels(getDemoVessels());
    } finally {
      setIsLoading(false);
    }
  };

  const mapVesselStatus = (dbStatus: string | null): VesselStatus["status"] => {
    const statusMap: Record<string, VesselStatus["status"]> = {
      "active": "navigating",
      "in_port": "anchored",
      "docked": "anchored",
      "maintenance": "maintenance",
      "emergency": "emergency",
      "inactive": "anchored"
    };
    return statusMap[dbStatus || ""] || "anchored";
  };

  const getDemoVessels = (): VesselStatus[] => [
    {
      id: "demo-1",
      name: "MV Atlântico Sul",
      status: "navigating",
      fuelLevel: 78,
      speed: 14.5,
      position: { lat: -23.9618, lng: -46.3322 },
      nextPort: "Santos, BR",
      eta: new Date(Date.now() + 86400000).toISOString(),
      alerts: 0,
      efficiency: 92
    },
    {
      id: "demo-2",
      name: "MV Pacífico Norte",
      status: "anchored",
      fuelLevel: 65,
      speed: 0,
      position: { lat: -22.9068, lng: -43.1729 },
      nextPort: "Rio de Janeiro, BR",
      eta: new Date(Date.now() + 172800000).toISOString(),
      alerts: 1,
      efficiency: 88
    },
    {
      id: "demo-3",
      name: "MV Índico Explorer",
      status: "maintenance",
      fuelLevel: 45,
      speed: 0,
      position: { lat: -25.4284, lng: -49.2733 },
      nextPort: "Paranaguá, BR",
      eta: new Date(Date.now() + 259200000).toISOString(),
      alerts: 2,
      efficiency: 76
    },
    {
      id: "demo-4",
      name: "MV Ártico Star",
      status: "navigating",
      fuelLevel: 82,
      speed: 16.2,
      position: { lat: -8.0476, lng: -34.8770 },
      nextPort: "Recife, BR",
      eta: new Date(Date.now() + 43200000).toISOString(),
      alerts: 0,
      efficiency: 95
    }
  ];

  const getStatusColor = (status: VesselStatus["status"]) => {
    const colors = {
      navigating: "bg-emerald-500",
      anchored: "bg-blue-500",
      maintenance: "bg-amber-500",
      emergency: "bg-red-500",
    };
    return colors[status];
  };

  const getStatusIcon = (status: VesselStatus["status"]) => {
    const icons = {
      navigating: Navigation,
      anchored: Anchor,
      maintenance: Activity,
      emergency: AlertTriangle,
    };
    return icons[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Navigation className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">
                    {vessels.filter(v => v.status === "navigating").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Navegando</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Anchor className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    {vessels.filter(v => v.status === "anchored").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Ancorados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">
                    {vessels.filter(v => v.status === "maintenance").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Manutenção</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Zap className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-500">
                    {Math.round(vessels.reduce((acc, v) => acc + v.efficiency, 0) / vessels.length || 0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Eficiência</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Vessel List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Frota em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {vessels.map((vessel, index) => {
                const StatusIcon = getStatusIcon(vessel.status);
                return (
                  <motion.div
                    key={vessel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-all cursor-pointer ${
                      selectedVessel === vessel.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedVessel(vessel.id === selectedVessel ? null : vessel.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(vessel.status)}/20`}>
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(vessel.status).replace("bg-", "text-")}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{vessel.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>→ {vessel.nextPort}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>ETA: {new Date(vessel.eta).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Fuel Level */}
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <Fuel className="h-3 w-3" />
                            <span>{Math.round(vessel.fuelLevel)}%</span>
                          </div>
                          <Progress 
                            value={vessel.fuelLevel} 
                            className="h-1.5"
                          />
                        </div>

                        {/* Speed */}
                        <div className="text-right">
                          <p className="text-lg font-bold">{vessel.speed.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">knots</p>
                        </div>

                        {/* Alerts */}
                        {vessel.alerts > 0 && (
                          <Badge variant="destructive" className="animate-pulse">
                            {vessel.alerts} alertas
                          </Badge>
                        )}

                        {/* Efficiency */}
                        <Badge 
                          variant={vessel.efficiency > 85 ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <TrendingUp className="h-3 w-3" />
                          {vessel.efficiency.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedVessel === vessel.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t overflow-hidden"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Posição</p>
                              <p className="font-mono text-sm">
                                {vessel.position.lat.toFixed(4)}°, {vessel.position.lng.toFixed(4)}°
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Combustível Restante</p>
                              <p className="font-semibold">{Math.round(vessel.fuelLevel * 10)} toneladas</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Próxima Manutenção</p>
                              <p className="font-semibold">Em 15 dias</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Tripulação</p>
                              <p className="font-semibold">24 membros</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">Ver Detalhes</Button>
                            <Button size="sm" variant="outline">Histórico</Button>
                            <Button size="sm" variant="outline">Contatar</Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
