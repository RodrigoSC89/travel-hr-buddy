/**
 * IoT Wearables Dashboard - World-Class Feature
 * Real-time crew vitals monitoring, fatigue detection, geofencing
 * No competitor integrates wearable IoT with maritime HR
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Heart, Thermometer, Wind, AlertTriangle, MapPin, Watch, Users, Brain, Moon } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

interface CrewVitals {
  id: string;
  name: string;
  rank: string;
  heartRate: number;
  temperature: number;
  oxygenSat: number;
  steps: number;
  fatigueScore: number;
  stressLevel: number;
  sleepHours: number;
  location: string;
  isOnDuty: boolean;
  alertLevel: "normal" | "warning" | "critical";
  lastUpdate: string;
}

function generateVitals(count: number): CrewVitals[] {
  const names = ["Cap. Rodrigues", "CO. Fernandes", "2O. Nascimento", "CE. Almeida", "2E. Martins", "Elet. Costa", "Bosun Lima", "AB. Oliveira", "AB. Santos", "Cook Pereira", "Steward Souza", "DPO. Ribeiro"];
  const ranks = ["Master", "Chief Officer", "2nd Officer", "Chief Engineer", "2nd Engineer", "Electrician", "Bosun", "AB Seaman", "AB Seaman", "Cook", "Steward", "DPO"];
  const locations = ["Ponte", "Praça de Máquinas", "Convés", "Cabine", "Cozinha", "Sala de Controle DP", "Paiol", "Oficina"];

  // Deterministic seed-based values per crew member
  const hrSeeds = [72, 68, 78, 85, 74, 65, 88, 70, 76, 62, 69, 92];
  const fatigueSeeds = [25, 35, 42, 68, 30, 22, 75, 45, 38, 20, 55, 82];
  const tempSeeds = [36.4, 36.2, 36.7, 37.1, 36.5, 36.3, 36.9, 36.6, 36.5, 36.1, 36.8, 37.2];
  const o2Seeds = [98, 97, 96, 95, 99, 98, 94, 97, 98, 99, 96, 95];
  const stepSeeds = [8500, 6200, 9800, 4300, 7100, 5500, 11200, 9500, 8800, 3200, 6800, 5100];
  const stressSeeds = [20, 30, 35, 55, 25, 18, 65, 40, 32, 15, 48, 70];
  const sleepSeeds = [7.2, 6.8, 6.1, 5.2, 7.5, 7.8, 4.8, 6.5, 6.9, 8.0, 5.5, 4.5];
  const locationIdx = [0, 1, 2, 3, 4, 5, 6, 7, 2, 4, 3, 5];
  const dutyPattern = [true, true, false, true, true, false, true, true, true, false, true, true];

  return Array.from({ length: Math.min(count, names.length) }, (_, i) => {
    const hr = hrSeeds[i];
    const fatigue = fatigueSeeds[i];
    const alert: CrewVitals["alertLevel"] = hr > 95 || fatigue > 80 ? "critical" : hr > 85 || fatigue > 60 ? "warning" : "normal";

    return {
      id: `WRB-${String(i + 1).padStart(3, "0")}`,
      name: names[i],
      rank: ranks[i],
      heartRate: hr,
      temperature: tempSeeds[i],
      oxygenSat: o2Seeds[i],
      steps: stepSeeds[i],
      fatigueScore: fatigue,
      stressLevel: stressSeeds[i],
      sleepHours: sleepSeeds[i],
      location: locations[locationIdx[i]],
      isOnDuty: dutyPattern[i],
      alertLevel: alert,
      lastUpdate: new Date(Date.now() - i * 25000).toISOString(),
    };
  });
}

function generateTimeSeries(): { time: string; heartRate: number; fatigue: number; stress: number }[] {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    heartRate: Math.round(68 + 12 * Math.sin(i * 0.26)),
    fatigue: Math.round(30 + 25 * Math.sin(i * 0.28 + 1)),
    stress: Math.round(25 + 20 * Math.sin(i * 0.3 + 2)),
  }));
}

export default function IoTWearablesDashboardPage() {
  const [crew, setCrew] = useState<CrewVitals[]>([]);
  const [selected, setSelected] = useState<CrewVitals | null>(null);
  const [timeSeries] = useState(generateTimeSeries());

  useEffect(() => {
    const data = generateVitals(12);
    setCrew(data);
    setSelected(data[0]);

    // Deterministic micro-oscillations simulating sensor drift
    const interval = setInterval(() => {
      setCrew(prev => prev.map((c, idx) => {
        const tick = Math.floor(Date.now() / 5000);
        const drift = Math.round(3 * Math.sin(tick * 0.7 + idx));
        const fatigueDrift = Math.round(2 * Math.sin(tick * 0.5 + idx * 1.3));
        return {
          ...c,
          heartRate: Math.max(55, Math.min(110, c.heartRate + drift)),
          fatigueScore: Math.max(0, Math.min(100, c.fatigueScore + fatigueDrift)),
          lastUpdate: new Date().toISOString(),
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const alerts = crew.filter(c => c.alertLevel !== "normal");
  const avgHR = Math.round(crew.reduce((a, b) => a + b.heartRate, 0) / (crew.length || 1));
  const avgFatigue = Math.round(crew.reduce((a, b) => a + b.fatigueScore, 0) / (crew.length || 1));
  const onDuty = crew.filter(c => c.isOnDuty).length;

  const alertBg = { normal: "bg-success/10", warning: "bg-warning/10", critical: "bg-destructive/10" };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container mx-auto p-6 space-y-6 max-w-7xl">
      <motion.div variants={fadeUp}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Watch className="h-6 w-6 text-primary" />
              IoT Wearables — Monitoramento de Tripulação em Tempo Real
            </CardTitle>
            <CardDescription>
              Sensores vestíveis monitoram frequência cardíaca, fadiga, sono e localização da tripulação. Alertas automáticos para condições de risco e violações MLC de descanso.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Tripulantes", value: crew.length, icon: Users, color: "text-primary" },
          { label: "Em Serviço", value: onDuty, icon: Activity, color: "text-success" },
          { label: "FC Média", value: `${avgHR} bpm`, icon: Heart, color: "text-red-500" },
          { label: "Fadiga Média", value: `${avgFatigue}%`, icon: Brain, color: avgFatigue > 60 ? "text-warning" : "text-success" },
          { label: "Alertas", value: alerts.length, icon: AlertTriangle, color: alerts.length > 0 ? "text-destructive" : "text-success" },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-5 w-5 ${kpi.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas Ativos ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.map(a => (
                  <div key={a.id} className={`p-3 border rounded-lg ${alertBg[a.alertLevel]}`}>
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{a.name}</p>
                      <Badge variant="destructive" className="text-xs">{a.alertLevel === "critical" ? "CRÍTICO" : "ATENÇÃO"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      FC: {a.heartRate}bpm • Fadiga: {a.fatigueScore}% • Sono: {a.sleepHours}h
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader><CardTitle className="text-base">Tripulação ({crew.length})</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {crew.map(c => (
                    <div
                      key={c.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selected?.id === c.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setSelected(c)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.rank}</p>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${c.alertLevel === "critical" ? "bg-destructive animate-pulse" : c.alertLevel === "warning" ? "bg-warning" : "bg-success"}`} />
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-400" />{c.heartRate}</span>
                        <span className="flex items-center gap-1"><Brain className="h-3 w-3" />{c.fatigueScore}%</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Panel */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
          {selected && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selected.name} — Sinais Vitais</CardTitle>
                  <CardDescription>{selected.rank} • {selected.location} • {selected.isOnDuty ? "Em Serviço" : "Descanso"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 border rounded-lg text-center">
                      <Heart className="h-5 w-5 mx-auto text-red-500 mb-1" />
                      <p className="text-2xl font-bold">{selected.heartRate}</p>
                      <p className="text-xs text-muted-foreground">bpm</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <Thermometer className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                      <p className="text-2xl font-bold">{selected.temperature.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">°C</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <Wind className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <p className="text-2xl font-bold">{selected.oxygenSat}</p>
                      <p className="text-xs text-muted-foreground">SpO2 %</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <Moon className="h-5 w-5 mx-auto text-indigo-500 mb-1" />
                      <p className="text-2xl font-bold">{selected.sleepHours.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">horas sono</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fadiga</span>
                        <span className={selected.fatigueScore > 70 ? "text-destructive" : selected.fatigueScore > 50 ? "text-warning" : "text-success"}>
                          {selected.fatigueScore}%
                        </span>
                      </div>
                      <Progress value={selected.fatigueScore} className={`[&>div]:${selected.fatigueScore > 70 ? "bg-destructive" : selected.fatigueScore > 50 ? "bg-warning" : "bg-success"}`} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stress</span>
                        <span>{selected.stressLevel}%</span>
                      </div>
                      <Progress value={selected.stressLevel} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Tendência 24h</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <Tooltip />
                      <Area type="monotone" dataKey="heartRate" stroke="hsl(0, 70%, 60%)" fill="hsl(0, 70%, 60%)" fillOpacity={0.15} name="FC (bpm)" />
                      <Area type="monotone" dataKey="fatigue" stroke="hsl(35, 90%, 55%)" fill="hsl(35, 90%, 55%)" fillOpacity={0.15} name="Fadiga %" />
                      <Area type="monotone" dataKey="stress" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} name="Stress %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
