import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Activity, AlertTriangle, CheckCircle, Thermometer, Wind, Droplets } from "lucide-react";

interface Chamber {
  id: string;
  name: string;
  status: "operational" | "pressurized" | "decompressing" | "maintenance" | "standby";
  pressure_bar: number;
  target_pressure: number;
  o2_percent: number;
  co2_ppm: number;
  temperature_c: number;
  humidity_percent: number;
  occupants: number;
  max_occupants: number;
  depth_equivalent_m: number;
  time_at_depth_hours: number;
}

const CHAMBERS: Chamber[] = [
  { id: "1", name: "Living Chamber #1", status: "pressurized", pressure_bar: 16.5, target_pressure: 16.5, o2_percent: 21.0, co2_ppm: 420, temperature_c: 28.5, humidity_percent: 55, occupants: 3, max_occupants: 4, depth_equivalent_m: 155, time_at_depth_hours: 72 },
  { id: "2", name: "Living Chamber #2", status: "pressurized", pressure_bar: 16.5, target_pressure: 16.5, o2_percent: 20.8, co2_ppm: 480, temperature_c: 29.0, humidity_percent: 58, occupants: 3, max_occupants: 4, depth_equivalent_m: 155, time_at_depth_hours: 72 },
  { id: "3", name: "Living Chamber #3", status: "standby", pressure_bar: 1.0, target_pressure: 1.0, o2_percent: 20.9, co2_ppm: 400, temperature_c: 22.0, humidity_percent: 45, occupants: 0, max_occupants: 4, depth_equivalent_m: 0, time_at_depth_hours: 0 },
  { id: "4", name: "Transfer Under Pressure", status: "operational", pressure_bar: 16.5, target_pressure: 16.5, o2_percent: 21.0, co2_ppm: 380, temperature_c: 27.0, humidity_percent: 50, occupants: 0, max_occupants: 2, depth_equivalent_m: 155, time_at_depth_hours: 0 },
  { id: "5", name: "Diving Bell", status: "operational", pressure_bar: 16.5, target_pressure: 16.5, o2_percent: 21.2, co2_ppm: 350, temperature_c: 26.0, humidity_percent: 48, occupants: 0, max_occupants: 3, depth_equivalent_m: 155, time_at_depth_hours: 0 },
  { id: "6", name: "Decompression Chamber", status: "decompressing", pressure_bar: 8.2, target_pressure: 1.0, o2_percent: 21.5, co2_ppm: 390, temperature_c: 27.5, humidity_percent: 52, occupants: 2, max_occupants: 4, depth_equivalent_m: 72, time_at_depth_hours: 36 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  operational: { label: "Operacional", color: "bg-green-500" },
  pressurized: { label: "Pressurizado", color: "bg-blue-500" },
  decompressing: { label: "Descomprimindo", color: "bg-amber-500" },
  maintenance: { label: "Manutenção", color: "bg-gray-500" },
  standby: { label: "Standby", color: "bg-slate-400" },
};

const LIMITS = {
  o2_min: 19.5, o2_max: 23.5,
  co2_max: 500,
  temp_min: 26, temp_max: 32,
  humidity_min: 40, humidity_max: 60,
};

export function PeotramSATSystem() {
  const [chambers, setChambers] = useState(CHAMBERS);

  const totalOccupants = chambers.reduce((a, c) => a + c.occupants, 0);
  const activeChambers = chambers.filter(c => c.status !== "standby" && c.status !== "maintenance").length;
  const alerts = chambers.filter(c => c.co2_ppm > LIMITS.co2_max || c.o2_percent < LIMITS.o2_min || c.o2_percent > LIMITS.o2_max);

  const isAlarm = (value: number, min: number, max: number) => value < min || value > max;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-3xl font-bold text-blue-600">{activeChambers}</p>
            <p className="text-xs text-muted-foreground">Câmaras Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{totalOccupants}</p>
            <p className="text-xs text-muted-foreground">Mergulhadores em SAT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{chambers[0]?.depth_equivalent_m || 0}m</p>
            <p className="text-xs text-muted-foreground">Profundidade SAT</p>
          </CardContent>
        </Card>
        <Card className={alerts.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={`text-2xl font-bold ${alerts.length > 0 ? "text-destructive" : "text-green-600"}`}>
              {alerts.length > 0 ? `⚠️ ${alerts.length}` : "✅ 0"}
            </p>
            <p className="text-xs text-muted-foreground">Alarmes</p>
          </CardContent>
        </Card>
      </div>

      {/* Chambers */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {chambers.map(chamber => {
          const statusCfg = STATUS_CONFIG[chamber.status];
          const o2Alarm = isAlarm(chamber.o2_percent, LIMITS.o2_min, LIMITS.o2_max);
          const co2Alarm = chamber.co2_ppm > LIMITS.co2_max;
          const tempAlarm = isAlarm(chamber.temperature_c, LIMITS.temp_min, LIMITS.temp_max);

          return (
            <Card key={chamber.id} className={`transition-all ${o2Alarm || co2Alarm ? "border-destructive/50 bg-destructive/5" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{chamber.name}</CardTitle>
                  <Badge className={`text-xs text-white ${statusCfg.color}`}>{statusCfg.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Pressure */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pressão:</span>
                  <span className="font-mono font-bold">{chamber.pressure_bar.toFixed(1)} bar ({chamber.depth_equivalent_m}m)</span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded text-center ${o2Alarm ? "bg-destructive/20" : "bg-green-500/10"}`}>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Wind className="h-3 w-3" /> O₂
                    </p>
                    <p className={`font-mono font-bold ${o2Alarm ? "text-destructive" : ""}`}>{chamber.o2_percent}%</p>
                  </div>
                  <div className={`p-2 rounded text-center ${co2Alarm ? "bg-destructive/20" : "bg-green-500/10"}`}>
                    <p className="text-xs text-muted-foreground">CO₂</p>
                    <p className={`font-mono font-bold ${co2Alarm ? "text-destructive" : ""}`}>{chamber.co2_ppm} ppm</p>
                  </div>
                  <div className={`p-2 rounded text-center ${tempAlarm ? "bg-warning/20" : "bg-green-500/10"}`}>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Thermometer className="h-3 w-3" /> Temp
                    </p>
                    <p className="font-mono font-bold">{chamber.temperature_c}°C</p>
                  </div>
                  <div className="p-2 rounded text-center bg-blue-500/10">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Droplets className="h-3 w-3" /> Umidade
                    </p>
                    <p className="font-mono font-bold">{chamber.humidity_percent}%</p>
                  </div>
                </div>

                {/* Occupants */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ocupantes:</span>
                  <span className="font-medium">{chamber.occupants}/{chamber.max_occupants}</span>
                </div>

                {chamber.time_at_depth_hours > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tempo na profundidade:</span>
                    <span className="font-medium">{chamber.time_at_depth_hours}h</span>
                  </div>
                )}

                {chamber.status === "decompressing" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso descompressão:</span>
                      <span className="font-medium">{Math.round(((chamber.target_pressure === 1 ? 16.5 - chamber.pressure_bar : 0) / 15.5) * 100)}%</span>
                    </div>
                    <Progress value={Math.round(((16.5 - chamber.pressure_bar) / 15.5) * 100)} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
