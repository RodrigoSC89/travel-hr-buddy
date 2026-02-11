/**
 * OpenSky Flights Page
 * Displays live flight data from OpenSky Network API
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plane, RefreshCw, MapPin, ArrowUpRight, 
  Gauge, Navigation, Radio, Globe 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface Aircraft {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
}

export default function OpenSkyFlights() {
  const [loading, setLoading] = useState(false);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [searchCallsign, setSearchCallsign] = useState("");
  const [bounds, setBounds] = useState({
    minLat: -34,
    maxLat: 5,
    minLon: -74,
    maxLon: -32
  });

  const fetchAircraft = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("flight-tracker", {
        body: { 
          operation: "live-aircraft",
          bounds
        }
      });

      if (error) throw error;

      if (data?.states) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- OpenSky API returns array-of-arrays state vectors
        const formattedAircraft: Aircraft[] = data.states.slice(0, 50).map((state: any[]) => ({
          icao24: state[0] || "",
          callsign: state[1]?.trim() || "N/A",
          origin_country: state[2] || "Desconhecido",
          longitude: state[5] || 0,
          latitude: state[6] || 0,
          altitude: state[7] || 0,
          velocity: state[9] || 0,
          heading: state[10] || 0,
          on_ground: state[8] || false
        }));
        setAircraft(formattedAircraft);
        toast.success(`${formattedAircraft.length} aeronaves encontradas!`);
      }
    } catch (error) {
      logger.error("Error fetching aircraft:", error);
      toast.error("Erro ao buscar dados de voos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
  }, []);

  const filteredAircraft = aircraft.filter(a => 
    a.callsign.toLowerCase().includes(searchCallsign.toLowerCase()) ||
    a.origin_country.toLowerCase().includes(searchCallsign.toLowerCase())
  );

  const stats = {
    total: aircraft.length,
    inFlight: aircraft.filter(a => !a.on_ground).length,
    onGround: aircraft.filter(a => a.on_ground).length,
    avgAltitude: Math.round(aircraft.filter(a => !a.on_ground).reduce((acc, a) => acc + a.altitude, 0) / aircraft.filter(a => !a.on_ground).length || 0)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🛫 OpenSky Flights</h1>
          <p className="text-muted-foreground">Rastreamento de voos em tempo real via OpenSky Network</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-success border-success">
            <Radio className="w-4 h-4 mr-1 animate-pulse" />
            AO VIVO
          </Badge>
          <Button onClick={fetchAircraft} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Plane className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Aeronaves</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ArrowUpRight className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.inFlight}</p>
                <p className="text-sm text-muted-foreground">Em Voo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MapPin className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.onGround}</p>
                <p className="text-sm text-muted-foreground">No Solo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Gauge className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats.avgAltitude.toLocaleString()}m</p>
                <p className="text-sm text-muted-foreground">Altitude Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por callsign ou país..."
              value={searchCallsign}
              onChange={(e) => setSearchCallsign(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="secondary">
              {filteredAircraft.length} resultados
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Aircraft List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Aeronaves Detectadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Carregando dados...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAircraft.map((ac, index) => (
                <div
                  key={`${ac.icao24}-${index}`}
                  className="p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{ac.callsign}</p>
                      <p className="text-sm text-muted-foreground">{ac.origin_country}</p>
                    </div>
                    <Badge variant={ac.on_ground ? "secondary" : "default"}>
                      {ac.on_ground ? "Solo" : "Voo"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <span>{Math.round(ac.altitude)}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      <span>{Math.round(ac.velocity)} m/s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4 text-muted-foreground" />
                      <span>{Math.round(ac.heading)}°</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs">{ac.latitude.toFixed(2)}, {ac.longitude.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredAircraft.length === 0 && (
            <div className="text-center py-8">
              <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma aeronave encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
