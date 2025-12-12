/**
 * Professional Weather Dashboard
 * Dashboard meteorológico profissional com dados em tempo real
 */

import { memo, memo, useState, useMemo } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge,
  Navigation,
  Waves,
  Sun,
  CloudSnow,
  Zap,
  AlertTriangle
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { ProfessionalHeader } from "./professional-header";
import { ProfessionalKPICard } from "./professional-kpi-card";

// Dados mockados
const weatherForecast = [
  { time: "00:00", temp: 22, humidity: 75, wind: 12, pressure: 1013 },
  { time: "03:00", temp: 21, humidity: 78, wind: 15, pressure: 1012 },
  { time: "06:00", temp: 20, humidity: 82, wind: 18, pressure: 1011 },
  { time: "09:00", temp: 23, humidity: 70, wind: 20, pressure: 1012 },
  { time: "12:00", temp: 26, humidity: 65, wind: 22, pressure: 1013 },
  { time: "15:00", temp: 27, humidity: 60, wind: 25, pressure: 1014 },
  { time: "18:00", temp: 25, humidity: 68, wind: 20, pressure: 1013 },
  { time: "21:00", temp: 23, humidity: 72, wind: 15, pressure: 1012 },
];

const waveData = [
  { time: "00:00", height: 1.2, period: 6, direction: 45 },
  { time: "03:00", height: 1.5, period: 7, direction: 50 },
  { time: "06:00", height: 1.8, period: 8, direction: 55 },
  { time: "09:00", height: 2.1, period: 9, direction: 60 },
  { time: "12:00", height: 2.4, period: 10, direction: 58 },
  { time: "15:00", height: 2.2, period: 9, direction: 52 },
  { time: "18:00", height: 1.9, period: 8, direction: 48 },
  { time: "21:00", height: 1.5, period: 7, direction: 45 },
];

const alerts = [
  { type: "warning", message: "Ventos fortes esperados entre 15h-18h", icon: Wind, color: "orange" },
  { type: "info", message: "Visibilidade excelente (>10km)", icon: Eye, color: "blue" },
  { type: "alert", message: "Ondas podem atingir 2.5m no período da tarde", icon: Waves, color: "red" },
];

export const ProfessionalWeatherDashboard = memo(function() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <ProfessionalHeader
        title="Meteorologia Marítima"
        subtitle="Monitoramento em tempo real de condições oceânicas e atmosféricas"
        showLogo={true}
        showRealTime={true}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProfessionalKPICard
          title="Temperatura"
          value="26"
          suffix="°C"
          icon={Sun}
          color="orange"
          change={2.5}
          trend="vs ontem"
          delay={0}
        />
        <ProfessionalKPICard
          title="Velocidade do Vento"
          value="22"
          suffix=" kts"
          icon={Wind}
          color="blue"
          change={8.3}
          trend="vs média"
          delay={0.1}
        />
        <ProfessionalKPICard
          title="Altura das Ondas"
          value="2.4"
          suffix="m"
          icon={Waves}
          color="purple"
          change={15.2}
          trend="acima do normal"
          delay={0.2}
        />
        <ProfessionalKPICard
          title="Visibilidade"
          value="12"
          suffix=" km"
          icon={Eye}
          color="green"
          change={-5.0}
          trend="excelente"
          delay={0.3}
        />
      </div>

      {/* Alertas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          const colorMap = {
            orange: "border-orange-500/30 bg-orange-500/5",
            blue: "border-blue-500/30 bg-blue-500/5",
            red: "border-red-500/30 bg-red-500/5",
          };
          
          return (
            <Card key={index} className={`border ${colorMap[alert.color as keyof typeof colorMap]}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.color === "orange" ? "bg-orange-500/10 text-orange-600" :
                      alert.color === "blue" ? "bg-blue-500/10 text-blue-600" :
                        "bg-red-500/10 text-red-600"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-relaxed">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="forecast">Previsão</TabsTrigger>
          <TabsTrigger value="waves">Ondas</TabsTrigger>
          <TabsTrigger value="wind">Ventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature & Humidity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-orange-500" />
                    Temperatura & Umidade
                  </CardTitle>
                  <CardDescription>Próximas 24 horas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weatherForecast}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#f97316" 
                        fillOpacity={1} 
                        fill="url(#colorTemp)"
                        name="Temperatura (°C)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="humidity" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorHumidity)"
                        name="Umidade (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Wind & Pressure */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-blue-500" />
                    Vento & Pressão
                  </CardTitle>
                  <CardDescription>Tendências atmosféricas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weatherForecast}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="wind" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Vento (kts)"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="pressure" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="Pressão (hPa)"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Current Conditions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Pressão", value: "1013 hPa", icon: Gauge, color: "purple" },
              { label: "Umidade", value: "65%", icon: Droplets, color: "blue" },
              { label: "Direção", value: "NE 45°", icon: Navigation, color: "green" },
              { label: "UV Index", value: "8 Alto", icon: AlertTriangle, color: "orange" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <div className={`inline-flex p-3 rounded-xl mb-3 ${
                      item.color === "purple" ? "bg-purple-500/10 text-purple-600" :
                        item.color === "blue" ? "bg-blue-500/10 text-blue-600" :
                          item.color === "green" ? "bg-green-500/10 text-green-600" :
                            "bg-orange-500/10 text-orange-600"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-2xl font-bold font-playfair">{item.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="waves" className="space-y-6">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-blue-500" />
                Análise de Ondas
              </CardTitle>
              <CardDescription>Altura, período e direção das ondas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={waveData}>
                  <defs>
                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="height" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorWave)"
                    name="Altura (m)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
